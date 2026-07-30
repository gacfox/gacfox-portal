//go:build dev

package portal

import (
	"io/fs"
	"os"
)

// StaticFS 从磁盘读取前端构建产物（开发模式：go run -tags dev，无需每次重新嵌入）
func StaticFS() (fs.FS, error) {
	return os.DirFS("frontend/dist"), nil
}
