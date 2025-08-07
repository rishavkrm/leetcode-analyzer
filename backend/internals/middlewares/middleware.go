package middlewares

import (
	"context"
	"firebase.google.com/go/v4/auth"
	"log"
	"net/http"
	"strings"
)

// Define a custom type for context keys to avoid collisions
type contextKey string

const UserIDContext contextKey = "firebaseUserUID"

// cors middleware to use in r.Use(CORSMiddleware)
func CORSMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000"}
			origin := r.Header.Get("Origin")
			for _, allowedOrigin := range allowedOrigins {
				if origin == allowedOrigin {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			// authorization header is needed for firebase auth
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-LeetCode-Cookie, X-LeetCode-Username")
			w.Header().Set("Access-Control-Max-Age", "86400")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func FirebaseAuthMiddleware(firebaseAuth *auth.Client) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if firebaseAuth == nil {
				log.Println("CRITICAL: Firebase Auth client not initialized in middleware.")
				http.Error(w, "Server configuration error", http.StatusInternalServerError)
				return
			}
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Missing Authorization Header", http.StatusUnauthorized)
				return
			}
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) != 2 || strings.ToLower(tokenParts[0]) != "bearer" {
				http.Error(w, "Invalid Authorization Header format (expected Bearer token)", http.StatusUnauthorized)
				return
			}
			idToken := tokenParts[1]
			token, err := firebaseAuth.VerifyIDToken(context.Background(), idToken)
			if err != nil {
				log.Printf("Error verifying ID token: %v\n", err)
				http.Error(w, "Invalid or expired ID Token", http.StatusUnauthorized)
				return
			}
			log.Printf("Successfully verified ID token for user UID: %s\n", token.UID)
			ctx := r.Context()
			ctx = context.WithValue(ctx, UserIDContext, token.UID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
