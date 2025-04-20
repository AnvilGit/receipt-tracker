# 📸 Receipt Tracker App

This is a cross-platform mobile app built with **Ionic + Angular** that allows users to capture, categorize, and manage photos of receipts. It supports claiming receipts, filtering by status, and tracking total claim amounts — perfect for expense management or reimbursement tracking.

## 🚀 Features

- 📷 Capture and save receipt photos using device camera
- ✍️ Add category and amount to each receipt
- ✅ Mark receipts as "claimed"
- 🔍 Filter receipts by:
  - All
  - Claimed
  - Unclaimed
- ✏️ Edit receipt details (category and label)
- 🗑️ Delete individual receipts
- 📊 View total claimed amount
- 💾 Data persistence using Capacitor Preferences (local storage)

## 🧰 Tech Stack

- [Ionic Framework](https://ionicframework.com/)
- [Angular](https://angular.io/)
- [Capacitor](https://capacitorjs.com/) (for local storage and native plugins)
- [Ionic Storage or Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences)

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Ionic CLI](https://ionicframework.com/docs/cli)  
  Install with: `npm install -g @ionic/cli`

### Setup

1. Clone the repository:
   git clone https://github.com/AvilGit/receipt-tracker.git

2. cd receipt-tracker

3. Install dependencies:

npm install

4. Run the app in development mode:

ionic serve

5. goto: http://localhost:8100 to see the app running

6. To test on a real device or emulator on Android Studio:

-ionic capacitor add android
-ionic capacitor open android


📝 Future Improvements
• Cloud sync or backup option

• OCR support for automatic receipt reading

• Authentication (login/logout)

• Export to PDF or CSV

• Intergrate API with JPA




🙌 Acknowledgements
Built with ❤️ using Ionic, Angular, and Capacitor.

📃 License
This project is licensed under the MIT License.
