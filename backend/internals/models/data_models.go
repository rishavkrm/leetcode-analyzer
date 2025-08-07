package models

import (
	"fmt"
	"time"
)

type RevisionProblem struct {
	LeetCodeSubmission
	Notes            string   `json:"notes" firestore:"notes"`
	Last_revised     string   `json:"last_revised" firestore:"last_revised"`
	Next_revision    string   `json:"next_revision" firestore:"next_revision"`
	Difficulty       string   `json:"difficulty" firestore:"difficulty"`
	Confidence_level int      `json:"confidence_level" firestore:"confidence_level"`
	Revision_count   int      `json:"revision_count" firestore:"revision_count"`
	Tags             []string `json:"tags" firestore:"tags"`
}

type RevisionList struct {
	UserID    string            `json:"userId" firestore:"userId"`
	Revisions []RevisionProblem `json:"revisions" firestore:"revisions"`
}

func (rp *RevisionProblem) Preprocess() error {
	if rp.Title == "" {
		return fmt.Errorf("no title provided for revision problem, title is required")
	}
	if rp.Confidence_level == 0 {
		return fmt.Errorf("no condidence level provided for revision problem, condidence level is required")
	}
	if rp.Notes == "" {
		rp.Notes = "No notes available"
	}
	if rp.Code == "" {
		rp.Code = "No code available"
	}
	return nil
}

func (rp *RevisionProblem) FindNextRevisionDate() {
	daysToAdd := 1
	switch rp.Confidence_level {
	case 1:
		daysToAdd = 1
	case 2:
		daysToAdd = 3
	case 3:
		daysToAdd = 7
	case 4:
		daysToAdd = 14
	case 5:
		daysToAdd = 30
	}
	rp.Next_revision = time.Now().AddDate(0, 0, daysToAdd).Format("2006-01-02")
}
