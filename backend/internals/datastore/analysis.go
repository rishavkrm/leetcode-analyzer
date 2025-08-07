package datastore

import (
	"context"
	"dsa-helper-backend/internals/models"
	"fmt"

)

type AnalysisTypes interface {
	models.HighLevelAnalysisResponse | models.AnalyseSubmissionResponse | models.SubmissionFeedbackResponse
}

func AddAnalysisProblems[T AnalysisTypes](ctx context.Context, ds *Datastore, toAdd T, title string, collectionName string) error {
	_, err := ds.FirestoreClient.Collection(collectionName).Doc(title).Set(ctx, toAdd)
	if err != nil {
		return fmt.Errorf("failed to add revision problems: %w", err)
	}
	return nil
}

func GetAnalysisProblems[T AnalysisTypes](ctx context.Context, title string, ds *Datastore, collectionName string) (T, error) {
	var retrievedProblem T
	dsnap, err := ds.FirestoreClient.Collection(collectionName).Doc(title).Get(ctx)
	if err != nil {
		return retrievedProblem, err
	}
	dsnap.DataTo(&retrievedProblem)
	return retrievedProblem, nil
}
