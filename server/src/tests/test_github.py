from unittest.mock import MagicMock, patch

from fastapi import status
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


@patch("github.router.requests.get")
def test_get_stars_success(mock_get: MagicMock):
    """Test successful retrieval of star count with valid repository details."""
    mock_response = MagicMock()
    mock_response.status_code = status.HTTP_200_OK
    mock_response.json.return_value = {
        "stargazers_count": 10000,
    }

    mock_get.return_value = mock_response

    response = client.get("/repository/microsoft/vscode/overview")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "star_count": 10000,
    }


def test_get_stars_missing_username():
    """Test behaviour when username is missing."""
    response = client.get("/repository/vscode/overview")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@patch("github.router.requests.get")
def test_get_stars_invalid_repository(mock_get: MagicMock):
    """Test behavior when repository does not exist under a valid user."""
    mock_response = MagicMock()
    mock_response.status_code = status.HTTP_404_NOT_FOUND
    mock_get.return_value = mock_response

    response = client.get("/repository/microsoft/angular/overview")
    assert response.status_code == status.HTTP_404_NOT_FOUND
