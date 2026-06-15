export interface ICreateIssue {
    title: string;
    description: string;
    type: "bug" | "feature";
}

export interface IUpdateIssue {
    title?: string;
    description?: string;
    type?: "bug" | "feature_request";
}

type SortType = "newest" | "oldest";
type IssueType = "bug" | "feature_request";
type IssueStatus = "open" | "in_progress" | "resolved";

export interface IGetIssuesQuery {
    sort?: SortType;
    type?: IssueType;
    status?: IssueStatus;
}