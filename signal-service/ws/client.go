package ws

import (
	"bitbucket.org/ittinc/go-shared-packages/shared-middleware"
	"bitbucket.org/ittinc/signal-service/model"
	"bytes"
	"context"
	"encoding/json"
	"github.com/sirupsen/logrus"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 48000
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

func contains(slice []string, item string) bool {
	set := make(map[string]struct{}, len(slice))
	for _, s := range slice {
		set[s] = struct{}{}
	}

	_, ok := set[item]
	return ok
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		tenantID := shared_middleware.ParseContextTenantModel(r.Context())
		preparedOrigin := strings.Replace(origin, tenantID, "*", 1)

		return contains(model.ALLOWED_HOSTS, preparedOrigin)
	},
}

type Client struct {
	hub  *Hub
	conn *websocket.Conn

	ID         uint32
	TenantID   string
	expiration int64

	Send chan []byte
}

func (c *Client) isClientExpired() bool {
	now := time.Now().Second()
	return c.expiration != 0 && c.expiration-int64(now) <= 0
}

func (c *Client) MakePayload(event, payload string) []byte {
	type Message struct {
		Event   string `json:"event,omitempty"`
		Payload string `json:"payload,omitempty"`
	}

	p := Message{
		Event:   event,
		Payload: payload,
	}

	jsonString, _ := json.Marshal(p)

	return jsonString
}

// readPump pumps messages from the websocket connection to the hub.
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		err := c.conn.Close()
		if err != nil {
			c.hub.log.WithField("error", err).Error("Cant close connection")
		}
	}()

	c.conn.SetReadLimit(maxMessageSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				c.hub.log.WithField("error", err).Error("Websocket unexpected close error")
			}
			break
		}

		type Message struct {
			Event   string
			Payload map[string]string
		}

		var msg = Message{}
		err = json.Unmarshal(message, &msg)
		if err != nil {
			message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
			c.hub.broadcast <- message
			break
		}

		switch msg.Event {
		case "auth":
			accessToken := msg.Payload["accessToken"]
			userID, success := c.hub.authImpl.DoAuth(context.Background(), c.TenantID, accessToken)
			if !success {
				c.Send <- c.MakePayload("authError", "Token not found or expired")
				return
			}

			_, ex, err := c.hub.authImpl.GetTokenInfo(context.Background(), c.TenantID, accessToken)

			if err != nil {
				c.hub.log.WithField("error", err).Error("Cant get token info from auth_service")
				c.Send <- c.MakePayload("authError", "Token not found or expired")
				return
			}

			if ex < 1 {
				c.Send <- c.MakePayload("authError", "Token not found or expired")
				return
			}

			now := time.Now()
			c.ID = userID
			c.expiration = now.Unix() + ex

			c.Send <- c.MakePayload("authSuccess", "")
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		err := c.conn.Close()
		if err != nil {
			c.hub.log.WithField("error", err).Error("Cant close connection")
		}
	}()

	for {
		select {
		case message, ok := <-c.Send:
			if c.isClientExpired() {
				err := c.conn.CloseHandler()(websocket.ClosePolicyViolation, "Token not found or expired")
				if err != nil {
					c.hub.log.WithField("error", err).Error("Cant close connection")
				}

				return
			}

			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				err := c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				if err != nil {
					c.hub.log.WithField("error", err).Error("Cant close connection")
				}

				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				c.hub.log.WithField("error", err).Error("Cant access next writer")
				return
			}

			_, err = w.Write(message)
			if err != nil {
				c.hub.log.WithField("error", err).Error("Cant send message")
			}

			// Add queued chat messages to the current websocket message.
			n := len(c.Send)
			for i := 0; i < n; i++ {
				_, err = w.Write(newline)
				if err != nil {
					c.hub.log.WithField("error", err).Error("Cant send message")
				}

				_, err = w.Write(<-c.Send)
				if err != nil {
					c.hub.log.WithField("error", err).Error("Cant send message")
				}
			}

			if err := w.Close(); err != nil {
				c.hub.log.WithField("error", err).Error("Cant close connection")
				return
			}
		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				c.hub.log.WithField("error", err).Error("Cant send ping")
				return
			}
		}
	}
}

func sendCloseMessage(log *logrus.Logger, conn *websocket.Conn, code int, reason string) {
	_ = conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
	err := conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(code, reason))
	if err != nil {
		log.WithField("error", err).Error("Cant send errored message")
	}
}

// serveWs handles websocket requests from the peer.
func serveWs(hub *Hub) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		tenantID := shared_middleware.ParseContextTenantModel(r.Context())

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			hub.log.WithField("error", err).Error("Cant upgrade connection to websocket")
			return
		}

		client := &Client{hub: hub, TenantID: tenantID, conn: conn, Send: make(chan []byte, 256)}
		client.hub.register <- client

		// Allow collection of memory referenced by the caller by doing all work in new goroutines.
		go client.writePump()
		go client.readPump()
	}
}
