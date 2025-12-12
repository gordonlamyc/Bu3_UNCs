import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MALAYSIA_STATES, State, District, Seat, Candidate } from './malaysia-data';

type StepKey = 'smartId' | 'face' | 'fingerprint' | 'vote';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  protected readonly flowOrder: StepKey[] = ['smartId', 'face', 'fingerprint', 'vote'];
  protected readonly steps = [
    {
      key: 'smartId' as const,
      title: 'MyKad / ID',
      caption: 'Verify your Malaysian Identity Card.'
    },
    {
      key: 'face' as const,
      title: 'Face Verification',
      caption: 'Biometric facial recognition match.'
    },
    {
      key: 'fingerprint' as const,
      title: 'Thumbprint',
      caption: 'Secure biometric thumbprint verification.'
    },
    {
      key: 'vote' as const,
      title: 'Cast Vote',
      caption: 'Select candidates for Parliament and State.'
    }
  ];

  // Data for Malaysia
  protected readonly states: State[] = MALAYSIA_STATES;

  // Selections
  protected selectedState = signal<State | null>(null);
  protected selectedDistrict = signal<District | null>(null);
  protected selectedDUN = signal<Seat | null>(null);

  protected parliamentVote = signal<string | null>(null);
  protected stateVote = signal<string | null>(null);

  protected voteSubmitted = signal(false);

  @ViewChild('faceVideo') set faceVideoRef(el: ElementRef<HTMLVideoElement> | undefined) {
    this.faceVideo = el ?? null;
    if (this.faceVideo && this.step() === 'face') {
      void this.startCamera();
    }
  }

  private faceVideo: ElementRef<HTMLVideoElement> | null = null;
  private videoStream: MediaStream | null = null;

  protected step = signal<StepKey>('smartId');
  protected photoTaken = signal(false);
  protected photoData = signal<string | null>(null);
  protected fingerprintConfirmed = signal(false);
  protected confirmation = signal<string | null>(null);
  protected cameraActive = signal(false);
  protected cameraError = signal<string | null>(null);

  protected now = new Date();

  protected stepIndex = computed(() => this.flowOrder.indexOf(this.step()));
  protected isAuthenticated = computed(() => this.step() === 'vote');

  constructor() {
    // Default selection for demo purposes
    this.selectedState.set(this.states[0]);
    this.selectedDistrict.set(this.states[0].districts[0]);
    if (this.states[0].districts[0].duns.length > 0) {
      this.selectedDUN.set(this.states[0].districts[0].duns[0]);
    } else {
      this.selectedDUN.set(null);
    }
  }

  private readonly stepWatcher = effect(() => {
    const current = this.step();
    if (current === 'face') {
      void this.startCamera();
    } else {
      this.stopCamera();
    }
  });

  protected advance(from: StepKey): void {
    if (this.step() !== from) return;
    if (from === 'face' && !this.photoTaken()) return;
    if (from === 'fingerprint' && !this.fingerprintConfirmed()) return;

    const next = this.flowOrder[this.stepIndex() + 1];
    if (!next) return;

    if (next === 'fingerprint') this.fingerprintConfirmed.set(false);

    // Reset votes when entering vote step
    if (next === 'vote') {
      this.parliamentVote.set(null);
      this.stateVote.set(null);
      this.voteSubmitted.set(false);
    }

    this.step.set(next);
  }

  protected takePhoto(): void {
    const frame = this.captureFrame();
    if (!frame) {
      this.cameraError.set('Unable to capture frame. Check camera permissions and retry.');
      return;
    }
    this.photoData.set(frame);
    this.photoTaken.set(true);
    this.confirmation.set(null);
    this.stopCamera();
  }

  protected resetPhoto(): void {
    this.photoTaken.set(false);
    this.photoData.set(null);
    this.confirmation.set(null);
    void this.startCamera();
  }

  protected confirmFingerprint(): void {
    this.fingerprintConfirmed.set(true);
    this.confirmation.set(null);
  }

  protected resetFingerprint(): void {
    this.fingerprintConfirmed.set(false);
    this.confirmation.set(null);
  }

  // Voting Logic
  protected onStateChange(event: Event) {
    const stateName = (event.target as HTMLSelectElement).value;
    const state = this.states.find(s => s.name === stateName) || null;
    this.selectedState.set(state);

    const district = state?.districts[0] || null;
    this.selectedDistrict.set(district);

    const dun = (district?.duns && district.duns.length > 0) ? district.duns[0] : null;
    this.selectedDUN.set(dun);

    this.resetVotes();
  }

  protected onDistrictChange(event: Event) {
    const districtName = (event.target as HTMLSelectElement).value;
    const district = this.selectedState()?.districts.find(d => d.name === districtName) || null;
    this.selectedDistrict.set(district);

    const dun = (district?.duns && district.duns.length > 0) ? district.duns[0] : null;
    this.selectedDUN.set(dun);

    this.resetVotes();
  }

  protected onDunChange(event: Event) {
    const dunCode = (event.target as HTMLSelectElement).value;
    const dun = this.selectedDistrict()?.duns.find(d => d.code === dunCode) || null;
    this.selectedDUN.set(dun);
    this.stateVote.set(null); // Reset only state vote
  }

  protected resetVotes() {
    this.parliamentVote.set(null);
    this.stateVote.set(null);
  }

  protected selectParliament(id: string): void {
    this.parliamentVote.set(id);
  }

  protected selectState(id: string): void {
    this.stateVote.set(id);
  }

  protected submitVote(): void {
    if (!this.parliamentVote()) return;

    // Check if state vote is required (i.e., if there are DUNs available)
    if (this.selectedDUN() && !this.stateVote()) return;

    // Simulate API call
    setTimeout(() => {
      this.voteSubmitted.set(true);
    }, 500);
  }

  protected restart(): void {
    this.step.set('smartId');
    this.photoTaken.set(false);
    this.photoData.set(null);
    this.fingerprintConfirmed.set(false);
    this.voteSubmitted.set(false);
    this.resetVotes();
  }

  ngOnDestroy(): void {
    this.stepWatcher.destroy();
    this.stopCamera();
  }

  protected async startCamera(): Promise<void> {
    if (this.cameraActive() || this.step() !== 'face') return;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError.set('Camera is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      this.videoStream = stream;
      const video = this.faceVideo?.nativeElement;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      this.cameraActive.set(true);
      this.cameraError.set(null);
    } catch (err) {
      console.error('Camera error', err);
      this.cameraError.set('Camera access was blocked. Please allow camera permissions.');
    }
  }

  protected stopCamera(): void {
    this.cameraActive.set(false);
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((t) => t.stop());
      this.videoStream = null;
    }
    const video = this.faceVideo?.nativeElement;
    if (video) video.srcObject = null;
  }

  private captureFrame(): string | null {
    const video = this.faceVideo?.nativeElement;
    if (!video || !video.videoWidth || !video.videoHeight) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  }
}
