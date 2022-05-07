package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	r.hello()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run(":5000") // listen and serve on port 5000
}
