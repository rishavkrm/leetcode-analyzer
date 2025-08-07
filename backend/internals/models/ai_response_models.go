package models

type HighLevelAnalysisResponse struct {
	BestSolution           bool   `json:"isBestSolution" firebase:"isBestSolution"`
	BestTimeComplexity     string `json:"bestTimeComplexity" firebase:"bestTimeComplexity"`
	CurrentTimeComplexity  string `json:"currentTimeComplexity" firebase:"currentTimeComplexity"`
	BestSpaceComplexity    string `json:"bestSpaceComplexity" firebase:"bestSpaceComplexity"`
	CurrentSpaceComplexity string `json:"currentSpaceComplexity" firebase:"currentSpaceComplexity"`
}

type AnalyseSubmissionResponse struct {
	OptimalCode string `json:"optimalCode" firebase:"optimalCode"`
	DiffView    string `json:"diffView" firebase:"diffView"`
	Algorithmic string `json:"algorithmic" firebase:"algorithmic"`
	Complexity  string `json:"complexity" firebase:"complexity"`
	Patterns    string `json:"patterns" firebase:"patterns"`
	Steps       []struct {
		Title       string `json:"title" firebase:"title"`
		Description string `json:"description" firebase:"description"`
		Code        string `json:"code" firebase:"code"`
	} `json:"steps"`
}

type SubmissionFeedbackResponse struct {
	CorrectnessAndLogic     string `json:"correctnessAndLogic" firebase:"correctnessAndLogic"`
	TimeComplexityAnalysis  string `json:"timeComplexityAnalysis" firebase:"timeComplexityAnalysis"`
	SpaceComplexityAnalysis string `json:"spaceComplexityAnalysis" firebase:"spaceComplexityAnalysis"`
	CodeStyleAndReadability string `json:"codeStyleAndReadability" firebase:"codeStyleAndReadability"`
	AlternativeApproaches   string `json:"alternativeApproaches" firebase:"alternativeApproaches"`
	Summary                 struct {
		BestSolution           bool   `json:"isBestSolution" firebase:"isBestSolution"`
		BestTimeComplexity     string `json:"bestTimeComplexity" firebase:"bestTimeComplexity"`
		CurrentTimeComplexity  string `json:"currentTimeComplexity" firebase:"currentTimeComplexity"`
		BestSpaceComplexity    string `json:"bestSpaceComplexity" firebase:"bestSpaceComplexity"`
		CurrentSpaceComplexity string `json:"currentSpaceComplexity" firebase:"currentSpaceComplexity"`
	} `json:"summary" firebase:"summary"`
}

type PatternInfo struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Priority    string   `json:"priority"`
	WhyPriority string   `json:"whyPriority"`
	KeyPoints   []string `json:"keyPoints"`
	Questions   []struct {
		ID         string `json:"id"`
		Title      string `json:"title"`
		Difficulty string `json:"difficulty"`
	} `json:"questions"`
	CommonMistakes []string `json:"commonMistakes"`
	Template       string   `json:"template"`
}

type DSAPatternAnalysisResponse struct {
	Strengths               []string `json:"strengths"`
	Weaknesses              []string `json:"weaknesses"`
	LearningRecommendations []string `json:"learningRecommendations"`
	CommonMistakesSummary   *string  `json:"commonMistakesSummary,omitempty"` // Use pointer for nullable
}
