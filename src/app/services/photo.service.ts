import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = []; // Array to hold all user photos
  private PHOTO_STORAGE: string = 'photos'; // Storage key name
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform; // Inject platform to determine if app runs on mobile or web
  }

  // Load saved photos from local storage
  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    // If running on web, convert saved file paths to base64 to show the image
    if (!this.platform.is('hybrid')) {
      for (let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });

        // Convert file data to base64 so it can be displayed in <img>
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  // Captures a new photo, saves it, and stores it in local storage
  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);

    // Construct the new photo object with default fields
    const userPhoto: UserPhoto = {
      ...savedImageFile,
      timestamp: Date.now(),
      label: 0,
      category: '',
      claimed: false,
      isEditing: false
    };

    // Add photo to the beginning of the array
    this.photos.unshift(userPhoto);

    // Save updated photo list to local storage
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });
  }

  // Save a picture to the device filesystem
  private async savePicture(photo: Photo) {
    const base64Data = await this.readAsBase64(photo); // Convert to base64 for saving
    const fileName = `receipt_${Date.now()}.jpeg`;  // More descriptive filename

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    if (this.platform.is('hybrid')) {
      // On native platforms: use file URI converted for webview access
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      // On web: display using the already available web path
      return {
        filepath: fileName,
        webviewPath: photo.webPath
      };
    }
  }

  // Reads a photo into base64 format for saving to filesystem
  private async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      // Native platform: read directly using the file path
      const file = await Filesystem.readFile({
        path: photo.path!
      });
      return file.data;
    } else {
      // Web platform: fetch the file and convert to base64
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  // Utility: Converts a Blob to a base64-encoded string
  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob); // Converts blob to base64
    });
  }
}

// Custom interface to define the structure of a photo entry
export interface UserPhoto {
  filepath: string;         // Internal storage file path
  webviewPath?: string;     // Path to show image in UI
  timestamp: number;        // Time when photo was taken
  label?: number;           // Amount (e.g., expense value)
  category?: string;        // Expense category or tag
  claimed?: boolean;        // If this photo has been claimed
  isEditing?: boolean;      // Whether currently in edit mode
}
