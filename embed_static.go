//go:build !dev

package portal

import (
	"embed"
	"io/fs"
)

// distFS 打包前端构建产物（all: 前缀使 .vite 等下划线/点开头目录也被包含）
//
//go:embed all:frontend/dist
var distFS embed.FS

// StaticFS 返回内嵌的前端静态资源（生产模式）
func StaticFS() (fs.FS, error) {
	return fs.Sub(distFS, "frontend/dist")
}
