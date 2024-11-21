package drag_drop

import (
	"fmt"
	"github.com/jinzhu/gorm"
)

func isMoveDown(desiredOrder, currentOrder int32) bool {
	return desiredOrder > currentOrder
}

func moveDown(db *gorm.DB, table string, currentOrder, desiredOrder int32, projectID uint32) error {
	q := `UPDATE %s
              SET custom_order = (custom_order - 10)
              WHERE custom_order > ?
              AND custom_order <= ? AND project_id = ?`

	return db.Exec(fmt.Sprintf(q, table), currentOrder, desiredOrder, projectID).Error
}

func moveUp(db *gorm.DB, table string, currentOrder, desiredOrder int32, projectID uint32) error {
	q := `UPDATE %s
              SET custom_order = (custom_order + 10)
              WHERE custom_order >= ?
              AND custom_order < ? AND project_id = ?`

	return db.Exec(fmt.Sprintf(q, table), desiredOrder, currentOrder, projectID).Error
}

func prepareDraggedPosition(db *gorm.DB, table string, currentOrder int32, projectID uint32) error {
	q := `UPDATE %s
              SET custom_order = 0
              WHERE custom_order = ? AND project_id = ?`

	return db.Exec(fmt.Sprintf(q, table), currentOrder, projectID).Error
}

func updateDraggedPosition(db *gorm.DB, table string, desiredOrder int32, projectID uint32) error {
	q := `UPDATE %s
              SET custom_order = ?
              WHERE custom_order = 0 AND project_id = ?`

	return db.Exec(fmt.Sprintf(q, table), desiredOrder, projectID).Error
}

func Drag(db *gorm.DB, table string, currentOrder, desiredOrder int32, projectID uint32) error {
	tx := db.Begin()
	err := prepareDraggedPosition(tx, table, currentOrder, projectID)
	if err != nil {
		tx.Rollback()
		return err
	}

	if isMoveDown(desiredOrder, currentOrder) {
		if err := moveDown(tx, table, currentOrder, desiredOrder, projectID); err != nil {
			tx.Rollback()
			return err
		}
	} else {
		if err := moveUp(tx, table, currentOrder, desiredOrder, projectID); err != nil {
			tx.Rollback()
			return err
		}
	}

	if err = updateDraggedPosition(tx, table, desiredOrder, projectID); err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
