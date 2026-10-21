from pydantic import BaseModel, Field, HttpUrl, RootModel


class Overview(BaseModel):
    html_url: HttpUrl
    stars_count: int = Field(validation_alias="stargazers_count")
    forks_count: int
    issues_count: int = Field(validation_alias="open_issues_count")
    last_update: str = Field(validation_alias="updated_at")
    topics: list[str]


class WeekActivity(BaseModel):
    week_start_date: str
    daywise_commits: list[int]


class CommitActivity(RootModel[list[WeekActivity]]):
    pass


class Author(BaseModel):
    username: str = Field(validation_alias="login")
    url: HttpUrl
    avatar_url: HttpUrl


class Contributor(BaseModel):
    commits_count: int = Field(validation_alias="total")
    author: Author | None


class Contributors(RootModel[list[Contributor]]):
    pass


class Languages(RootModel[dict[str, float]]):
    pass


class CommitTiming(BaseModel):
    day: int
    hour: int
    count: int


class PunchCard(RootModel[list[CommitTiming]]):
    pass


class Profile(BaseModel):
    documentation: HttpUrl | None
    code_of_conduct: HttpUrl | None
    license: HttpUrl | None
    readme: HttpUrl | None
    issue_template: HttpUrl | None
    pull_request_template: HttpUrl | None
