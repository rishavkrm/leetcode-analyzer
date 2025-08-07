package models

type LeetCodeSubmission struct {
	ID                     int64  `json:"id" firestore:"id"`
	Title                  string `json:"title" firestore:"title"`
	Code                   string `json:"code" firestore:"code"`
	Lang                   string `json:"lang" firestore:"lang"`
	LangName               string `json:"lang_name" firestore:"lang_name"`
	Timestamp              int64  `json:"timestamp" firestore:"timestamp"`
	StatusDisplay          string `json:"status_display" firestore:"status_display"`
	Runtime                string `json:"runtime" firestore:"runtime"`
	URL                    string `json:"url" firestore:"url"`
	IsPending              string `json:"is_pending" firestore:"is_pending"`
	Memory                 string `json:"memory" firestore:"memory"`
	IsBestSolution         bool   `json:"isBestSolution" firestore:"isBestSolution"`
	BestTimeComplexity     string `json:"bestTimeComplexity" firestore:"bestTimeComplexity"`
	CurrentTimeComplexity  string `json:"currentTimeComplexity" firestore:"currentTimeComplexity"`
	BestSpaceComplexity    string `json:"bestSpaceComplexity" firestore:"bestSpaceComplexity"`
	CurrentSpaceComplexity string `json:"currentSpaceComplexity" firestore:"currentSpaceComplexity"`
}

type SubmissionsDump struct {
	Submissions []LeetCodeSubmission `json:"submissions_dump"`
}

type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

type CreateUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
