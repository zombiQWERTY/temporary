package ws

import (
	"bitbucket.org/ittinc/signal-service/auth"
	"github.com/sirupsen/logrus"
)

type Hub struct {
	log        *logrus.Entry
	authImpl   auth.Implementation
	Clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

func NewHub(authImpl auth.Implementation, log *logrus.Entry) *Hub {
	return &Hub{
		log:        log,
		authImpl:   authImpl,
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.Clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
		case message := <-h.broadcast:
			for client := range h.Clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.Clients, client)
				}
			}
		}
	}
}
