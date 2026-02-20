<p align="center">
  <img src="logo.png" alt="WhereIsIt Logo" width="200" />
</p>

# WhereIsIt - Home Assistant Addon

A physical storage management system for Home Assistant.

## Features
- **Hierarchical Storage**: Units -> Boxes -> Items
- **QR Codes**: Generate and print QR codes for boxes.
- **Search**: Quickly find items or boxes.
- **Mobile First**: Designed for the Home Assistant Companion App.

## Installation

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2FD3L05%2Fwhereisit)

1.  Click the button above to add this repository to your Home Assistant instance.
2.  Install "WhereIsIt" from the Add-on Store.
2.  Start the addon.
3.  Open the app from the sidebar.

## Usage
1.  **Create Storage Unit**: Define a location (e.g., Garage, Attic).
2.  **Add Boxes**: Create boxes within units. The system generates a unique slug.
3.  **Add Items**: List contents of each box.
4.  **Connect**:
    - **QR Code**: Open a box view and click the QR icon. Print and stick to the box.

## Development
- Frontend: Lit + Vite
- Backend: Python + FastAPI + SQLAlchemy
- Database: SQLite
