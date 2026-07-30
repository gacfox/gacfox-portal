package model

import "time"

// User 管理员用户（单用户系统）
type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"uniqueIndex;size:64;not null" json:"username"`
	PasswordHash string    `gorm:"size:128;not null" json:"-"`
	// PasswordVersion 随每次改密递增，JWT 中携带签发时的版本，
	// 版本不匹配即令牌失效（改密后旧令牌全部作废）
	PasswordVersion int       `gorm:"not null;default:0" json:"-"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// Category 书签分类
type Category struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Name      string     `gorm:"size:128;not null" json:"name"`
	Sort      int        `gorm:"not null;default:0" json:"sort"`
	Bookmarks []Bookmark `gorm:"constraint:OnDelete:CASCADE" json:"bookmarks"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

// Bookmark 导航链接
type Bookmark struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CategoryID  uint      `gorm:"index;not null" json:"categoryId"`
	Name        string    `gorm:"size:128;not null" json:"name"`
	URL         string    `gorm:"size:512;not null" json:"url"`
	Icon        string    `gorm:"size:512" json:"icon"`
	Description string    `gorm:"size:512" json:"description"`
	Sort        int       `gorm:"not null;default:0" json:"sort"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Widget 小组件，Config 为 JSON 字符串，存放各 widget 的自定义属性（如 steam-wishlist 的 ids）
type Widget struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:64;not null" json:"name"`
	GridWidth string    `gorm:"size:16;not null;default:'full'" json:"gridWidth"`
	Sort      int       `gorm:"not null;default:0" json:"sort"`
	Config    string    `gorm:"type:text" json:"config"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Setting 站点设置的键值存储，键如 site.title / site.icon / site.background.light
type Setting struct {
	Key   string `gorm:"primaryKey;size:128" json:"key"`
	Value string `gorm:"type:text" json:"value"`
}
