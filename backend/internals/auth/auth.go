package backendAuth

import (
	"context"
	"fmt"
	"log"
	"firebase.google.com/go/v4/auth"
)

func CreateUserWithEmailPassword(firebaseAuth *auth.Client  ,email string, password string) error {
	if firebaseAuth == nil {
		log.Println("Firebase Auth client not initialized.")
		return fmt.Errorf("firebase auth client not initialized")
	}
	params := (&auth.UserToCreate{}).
		Email(email).
		Password(password).
		EmailVerified(false).
		Disabled(false) 

	u, err := firebaseAuth.CreateUser(context.Background(), params)
	if err != nil {
		log.Printf("Error creating Firebase user: %v\n", err)
		return fmt.Errorf("error creating Firebase user: %w", err)
	}
	log.Printf("Successfully created user: %s (UID: %s)\n", u.Email, u.UID)
	return nil
}

func VerifyGoogleIDToken(firebaseAuth *auth.Client, idToken string) (*auth.Token, error) {
    if firebaseAuth == nil {
        log.Println("Firebase Auth client not initialized.")
        return nil, fmt.Errorf("firebase auth client not initialized")
    }
    
    // Verify the ID token
    token, err := firebaseAuth.VerifyIDToken(context.Background(), idToken)
    if err != nil {
        log.Printf("Error verifying Google ID token: %v\n", err)
        return nil, fmt.Errorf("error verifying Google ID token: %w", err)
    }
    
    log.Printf("Successfully verified Google token for user: %s\n", token.UID)
    return token, nil
}