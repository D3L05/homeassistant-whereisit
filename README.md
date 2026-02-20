# WhereIsIt - Home Assistant Addon

A physical storage management system for Home Assistant.

## Features
- **Hierarchical Storage**: Units -> Boxes -> Items
- **QR Codes**: Generate and print QR codes for boxes.
- **Search**: Quickly find items or boxes.
- **Mobile First**: Designed for the Home Assistant Companion App.

## Installation
1.  Add this repository to your Home Assistant Addon Store or install locally.
2.  Start the addon.
3.  Open the Web UI via Ingress.

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
