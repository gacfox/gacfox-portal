package database

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"gacfox-portal/internal/model"
)

// Init 打开（必要时创建）sqlite 数据库并自动迁移。
// 数据库文件位于 dataDir/gacfox.db。
func Init(dataDir string) (*gorm.DB, error) {
	if err := os.MkdirAll(dataDir, 0o755); err != nil {
		return nil, fmt.Errorf("create data dir: %w", err)
	}

	dbPath := filepath.Join(dataDir, "gacfox.db")
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("open database %s: %w", dbPath, err)
	}

	if err := db.AutoMigrate(&model.User{}, &model.Category{}, &model.Bookmark{}, &model.Widget{}, &model.Setting{}); err != nil {
		return nil, fmt.Errorf("auto migrate: %w", err)
	}

	return db, nil
}
