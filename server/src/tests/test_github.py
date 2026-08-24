from unittest.mock import MagicMock, patch

from fastapi import status
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

USERNAME = "harshdeep"
REPOSITORY = "vantage"
STAR_COUNT = 10000


@patch("github.services.requests.get")
def test_get_stars_success(mock_get: MagicMock):
    """Test successful retrieval of star count with valid repositorysitory details."""
    mock_response = MagicMock()
    mock_response.status_code = status.HTTP_200_OK
    mock_response.json.return_value = {
        "name": REPOSITORY,
        "stargazers_count": STAR_COUNT,
        "owner": {"login": USERNAME},
    }

    mock_get.return_value = mock_response
    response = client.get(f"/repository/{USERNAME}/{REPOSITORY}/stars")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "owner": USERNAME,
        "repository": REPOSITORY,
        "stargazers_count": STAR_COUNT,
    }


def test_get_stars_missing_username():
    """Test routing when username is missing (path becomes invalid)."""
    response = client.get(f"/repository/{REPOSITORY}/stars")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@patch("github.services.requests.get")
def test_get_stars_invalid_repository(mock_get: MagicMock):
    """Test behavior when repository does not exist under a valid user."""
    mock_response = MagicMock()
    mock_response.status_code = status.HTTP_404_NOT_FOUND
    mock_response.json.return_value = {"message": "Not Found"}
    mock_get.return_value = mock_response

    response = client.get(f"/repository/{USERNAME}/invalid_repository/stars")
    assert response.status_code == status.HTTP_404_NOT_FOUND
