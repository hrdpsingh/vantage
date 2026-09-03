import json
from unittest.mock import MagicMock, patch

from fastapi import status
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


@patch("github.router.requests.get")
def test_get_overview_success(mock_get: MagicMock):
    """Test successful retrieval of overview with valid repository details."""
    mock_response = MagicMock()
    mock_response.status_code = status.HTTP_200_OK

    with open("src/tests/mocks/overview.success.json") as file:
        data = json.load(file)

    mock_response.json.return_value = data
    mock_get.return_value = mock_response

    response = client.get("/repository/microsoft/vscode/overview")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {
        "star_count": 190406,
        "fork_count": 41941,
        "last_update": "2026.09.02",
    }


def test_get_overview_missing_username():
    """Test behaviour when username is missing."""
    response = client.get("/repository/vscode/overview")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@patch("github.router.requests.get")
def test_get_overview_invalid_repository(mock_get: MagicMock):
    """Test behavior when repository does not exist under a valid user."""
    mock_response = MagicMock()
    mock_response.status_code = status.HTTP_404_NOT_FOUND

    with open("src/tests/mocks/overview.invalid.json") as file:
        data = json.load(file)

    mock_response.json.return_value = data
    mock_get.return_value = mock_response

    response = client.get("/repository/microsoft/angular/overview")

    assert response.status_code == status.HTTP_404_NOT_FOUND
