<p align="center">
  <a href="https://ko-fi.com/A0A81YJZ1A" target="_blank"><img height="36" style="border:0px;height:36px;" src="https://storage.ko-fi.com/cdn/kofi6.png?v=6" border="0" alt="Buy Me a Coffee at ko-fi.com" /></a>
</p>

# WhereIsIt - Home Assistant Addon

WhereIsIt is a mobile-friendly Home Assistant add-on for organizing physical storage. Track storage units such as a garage or attic, the boxes inside them, and the items stored in each box.

## Features
- **Hierarchical Storage**: Organize everything as Storage Units -> Boxes -> Items.
- **Name Sorting**: Sort storage units, boxes, and items by name in ascending (A–Z) or descending (Z–A) order.
- **Natural Name Ordering**: Names containing numbers sort naturally, so `Box 2` appears before `Box 10`.
- **QR Codes**: Generate and print QR codes for boxes for quick access to their contents.
- **Search**: Quickly find items or boxes by name, description, or category.
- **Categories**: Assign multiple categories to items and filter by category.
- **Photos**: Add photos to items to make them easier to identify.
- **Mobile First**: Designed for use from the Home Assistant Companion App.

## How it works

1. Create a **Storage Unit** for a location such as Garage, Attic, or Basement.
2. Add **Boxes** inside the storage unit.
3. Add **Items** to each box, including quantities, categories, descriptions, and photos.
4. Use the **sort icon** on any list to switch between A–Z and Z–A name order.
5. Open a box from its QR code to see its contents quickly.

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
