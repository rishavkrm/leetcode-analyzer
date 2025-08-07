package backendAuth

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth" // Import the auth package
	"google.golang.org/api/option"
)

func InitializeFirebase(mode string) (*auth.Client, *firestore.Client, error) {
	app, err := firebase.NewApp(context.Background(), nil)
	if err != nil && mode == "PROD" {
		return nil, nil, fmt.Errorf("error initializing app: %w", err)
	}
	if mode == "DEV" {
		// opt := option.WithCredentialsFile("/Users/rishavkumar/Documents/firebase/leetcode-analyzer-firebase-adminsdk-fbsvc-2d77661b04.json") // 👈 Replace with your actual path or use env var
		opt := option.WithCredentialsFile("../firebase/leetcode-analyzer-firebase-adminsdk-fbsvc-2d77661b04.json")
		app, err = firebase.NewApp(context.Background(), nil, opt)
		if err != nil {
			log.Printf("error initializing app: %v\n", err)
		}
	}

	authClient, err := app.Auth(context.Background())
	if err != nil {
		return nil, nil, fmt.Errorf("error getting auth client: %w", err)
	}
	log.Println("Firebase Authentication initialized successfully")
	firestoreClient, err := app.Firestore(context.Background())
	if err != nil {
		return nil, nil, fmt.Errorf("error getting firestore client: %w", err)
	}
	log.Println("Firestore initialized successfully")
	return authClient, firestoreClient, nil
}
