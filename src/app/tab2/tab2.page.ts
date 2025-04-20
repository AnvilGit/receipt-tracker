import { Component } from '@angular/core';
import { PhotoService, UserPhoto } from '../services/photo.service';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { ToastController, NavController, Platform } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ModalController } from '@ionic/angular';
import { ImageViewerModalComponent } from '../components/image-viewer-modal/image-viewer-modal.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  // Filter state for toggling between all, claimed, and unclaimed receipts
  filter: 'all' | 'claimed' | 'unclaimed' = 'all';

  platform: Platform; // Declare platform as a class property

  constructor(
    public photoService: PhotoService,  // Inject the photo service to access photo data and methods
    private toastController: ToastController, // Used for showing toast notifications
    private navCtrl: NavController, // Used for navigation
    private modalCtrl: ModalController, // Used for displaying modals
    platform: Platform // Inject platform to determine if app runs on mobile or web
  ) {
    this.platform = platform; // Store the platform instance for later use
  }

  // Lifecycle hook - loads saved photos when component is initialized
  async ngOnInit() {
    await this.photoService.loadSaved();
  }


  // Filters the displayed photos based on selected filter
  getFilteredPhotos() {
    return this.photoService.photos.filter(photo => {
      if (this.filter === 'claimed') return photo.claimed;
      if (this.filter === 'unclaimed') return !photo.claimed;
      return true; // Show all if filter is "all"
    });
  }

  // Marks a photo as claimed if required fields are filled and saves it
  async claimReceipt(index: number) {
    const photo = this.photoService.photos[index];

    // Validation: ensure category and label are provided
    if (!photo.label || !photo.category) {
      this.presentToast('Please select type and enter amount before claiming.');
      return;
    }

    // Mark the receipt as claimed
    photo.claimed = true;

    // Persist changes to local storage
    await Preferences.set({
      key: this.photoService['PHOTO_STORAGE'],
      value: JSON.stringify(this.photoService.photos),
    });

    // Show confirmation message
    this.presentToast(`Receipt ${index + 1} claimed successfully!`);
  }

  // Deletes the photo at given index and updates storage
  async deletePhoto(filteredIndex: number) {
    const filteredPhotos = this.getFilteredPhotos();
    const photoToDelete = filteredPhotos[filteredIndex];
  
    // Find the actual index in the main array
    const actualIndex = this.photoService.photos.findIndex(photo => photo.filepath === photoToDelete.filepath);
  
    if (actualIndex > -1) {
      this.photoService.photos.splice(actualIndex, 1);
  
      // Persist updated list to storage
      await Preferences.set({
        key: this.photoService['PHOTO_STORAGE'],
        value: JSON.stringify(this.photoService.photos),
      });
  
      this.presentToast('Photo deleted successfully.');
    }
  }
  

  // Calculates the total value of all labeled receipts
  getTotalClaim(): number {
    return this.photoService.photos.reduce((total, photo) => {
      return total + (photo.label ? parseFloat(photo.label.toString()) : 0);
    }, 0);
  }

  // Trigger the photo service to capture a new photo
  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  // Toggle edit mode for a photo and persist the change
  async editPhoto(index: number) {
    const photo = this.photoService.photos[index];
    photo.isEditing = !photo.isEditing; // Toggle edit state

    // Persist updated photo data to local storage
    await Preferences.set({
      key: this.photoService['PHOTO_STORAGE'],
      value: JSON.stringify(this.photoService.photos),
    });
  }

// Opens the clicked image in a modal using the stored webviewPath
async viewImage(photo: UserPhoto) {
  try {
    let imageData: string;

    if (this.platform.is('hybrid')) {
      // On Android/iOS, use the webviewPath directly (already converted by Capacitor)
      imageData = photo.webviewPath || '';
    } else {
      // On web, read the file and convert to base64
      const file = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data
      });
      imageData = `data:image/jpeg;base64,${file.data}`;
    }

    // Open modal with the image data
    const modal = await this.modalCtrl.create({
      component: ImageViewerModalComponent,
      componentProps: { imageData }
    });
    await modal.present();
  } catch (error) {
    console.error('Error opening image:', error);
    this.presentToast('Could not open receipt image');
  }
}
  
  

  // Utility: Shows a toast message with given content
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }
}
