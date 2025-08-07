package datastore

import (
	"context"
	"dsa-helper-backend/internals/models"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

type Datastore struct {
	FirestoreClient *firestore.Client
}

func (ds *Datastore) AddRevisionProblems(ctx context.Context, userID string, newRevisions []models.RevisionProblem) error {
	for i := range newRevisions {
		err := newRevisions[i].Preprocess()
		if err != nil {
			return err
		}
		newRevisions[i].FindNextRevisionDate()
	}
	oldRevisions, err := ds.GetRevisionProblems(ctx, userID)
	if err != nil {
		return err
	}
	for i := 0; i < len(oldRevisions); i++ {
		isAlreadyPresent := false
		for j := 0; j < len(newRevisions); j++ {
			if newRevisions[j].Title == oldRevisions[i].Title {
				isAlreadyPresent = true
			}
		}
		if !isAlreadyPresent {
			newRevisions = append(newRevisions, oldRevisions[i])
		}
	}
	_, err = ds.FirestoreClient.Collection("revisions").Doc(userID).Set(ctx, models.RevisionList{
		UserID:    userID,
		Revisions: newRevisions,
	})
	if err != nil {
		return fmt.Errorf("failed to add revision problems: %w", err)
	}
	return nil
}

func (ds *Datastore) GetRevisionProblems(ctx context.Context, userID string) ([]models.RevisionProblem, error) {
	iter := ds.FirestoreClient.Collection("revisions").Where("userId", "==", userID).Documents(ctx)
	var revisionList models.RevisionList
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		if err := doc.DataTo(&revisionList); err != nil {
			return nil, fmt.Errorf("failed to parse revision problem: %w", err)
		}
	}
	return revisionList.Revisions, nil
}

func (ds *Datastore) DeleteRevisionProblem(ctx context.Context, userID string, problem models.RevisionProblem) error {
	// get all
	problems, err := ds.GetRevisionProblems(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get revision problems: %w", err)
	}
	var updatedProblems []models.RevisionProblem
	for _, p := range problems {
		if p.Title != problem.Title {
			updatedProblems = append(updatedProblems, p)
		}
	}
	_, err = ds.FirestoreClient.Collection("revisions").Doc(userID).Set(ctx, models.RevisionList{
		UserID:    userID,
		Revisions: updatedProblems,
	})
	if err != nil {
		return fmt.Errorf("failed to delete the revision problem: %w", err)
	}
	return nil
}

func (ds *Datastore) UpdateRevisionProblem(ctx context.Context, userID string, problem models.RevisionProblem) error {
	// get all problems
	problems, err := ds.GetRevisionProblems(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get revision problems: %w", err)
	}
	var updatedProblems []models.RevisionProblem
	for _, p := range problems {
		if p.Title == problem.Title {
			p = problem
			p.FindNextRevisionDate()
		}
		updatedProblems = append(updatedProblems, p)
	}
	_, err = ds.FirestoreClient.Collection("revisions").Doc(userID).Set(ctx, models.RevisionList{
		UserID:    userID,
		Revisions: updatedProblems,
	})
	if err != nil {
		return fmt.Errorf("failed to update the revision problem: %w", err)
	}
	return nil
}

func (ds *Datastore) GetDueRevisionProblems(ctx context.Context, userID string) ([]models.RevisionProblem, error) {
	problems, err := ds.GetRevisionProblems(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get revision problems: %w", err)
	}

	var dueProblems []models.RevisionProblem
	today := time.Now().Format("2006-01-02")

	for _, p := range problems {
		if p.Next_revision <= today {
			dueProblems = append(dueProblems, p)
		}
	}
	return dueProblems, nil
}
