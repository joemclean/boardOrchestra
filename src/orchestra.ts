import * as Tone from 'tone';
import { Rect } from '@mirohq/websdk-types';
import { Transport } from 'tone/build/esm/core/clock/Transport';


class Voice {
  private synth: Tone.Synth;
  private panner: Tone.Panner;
  public gain: Tone.Gain;
  public filter: Tone.Filter;
  private synthBus: Tone.Gain;

  constructor(synth: Tone.Synth, synthBus: Tone.Gain) {
    this.synth = synth;
    this.gain = new Tone.Gain();
    this.panner = new Tone.Panner();
    this.filter = new Tone.Filter();
    this.synthBus = synthBus;
    this.synth.connect(this.gain.connect(this.panner.connect(this.filter.connect(synthBus))));
  }

  setPan(panPosition: number) {
    this.panner.pan.rampTo(panPosition, 0.001);
  }

  play(note: string, duration: number | string, time: number) {
    this.synth.triggerAttackRelease(note, duration, time);
  };
}


class Scheduler {
  private noteSchedule: Array<string> = [];
  public synthVoice: Voice;

  constructor(synthVoice: Voice) {
    this.synthVoice = synthVoice;
  }

  hasScheduledNotes(): boolean {
    return (this.noteSchedule.length > 0);
  }

  scheduleNoteToPlay(note: string){
    this.noteSchedule.push(note);
  }

  playScheduledNote(duration: number | string, time: number) {
    const note = this.noteSchedule[0];
    this.synthVoice.play(note, duration, time);
    this.noteSchedule.shift();
  }
}

export class Orchestra {
  private synthReverbBus: Tone.Reverb;
  private hatsGain: Tone.Gain;
  private hatsVelocity: Tone.Gain;
  private kickGain: Tone.Gain;
  private drumFilter: Tone.Filter;
  private drumReverbBus: Tone.Reverb;
  private drumGain: Tone.Gain;
  private mainBus: Tone.Gain;
  private synthBus: Tone.Gain;

  public widgetSelected: boolean = false;

  public createWidgetScheduler: Scheduler;
  public deleteWidgetScheduler: Scheduler;
  public updateSelectionScheduler: Scheduler;
  public updateWidgetScheduler: Scheduler;
  public basslineScheduler: Scheduler;

  private kick: Tone.MembraneSynth;
  private hihat: Tone.MetalSynth;
  private hihat2: Tone.MetalSynth;

  private transport: Transport = Tone.Transport;
  private iterator: number = 0;
  private sequence: Tone.Sequence;

  private isInitialized = false;
  
  constructor(){

    this.transport.timeSignature = [4, 4];

    // Create all the audio nodes
    this.synthReverbBus = new Tone.Reverb();
    this.synthReverbBus.decay = 5;
    this.hatsGain = new Tone.Gain();
    this.hatsVelocity = new Tone.Gain();
    this.kickGain = new Tone.Gain();
    this.drumFilter = new Tone.Filter({
    frequency: 8000,
    type: "lowpass"
    });
    this.drumReverbBus = new Tone.Reverb();
    this.drumReverbBus.decay = 0.3;
    this.drumGain = new Tone.Gain();
    this.mainBus = new Tone.Gain().toDestination();
    this.synthBus = new Tone.Gain();

    const synth1 = new Tone.Synth(
      {
        oscillator:{
          type: 'triangle'
        },
        envelope: {
          attack: 1,
          decay: 1,
          sustain: 0.5,
          release: 4
        }
      }
    );
    const synth2 = new Tone.Synth({
      oscillator:{
        type: 'square'
      },
      envelope: {
        attack: 0.2,
        decay: 1,
        sustain: 0.5,
        release: 4
      },
    });
    const synth3 = new Tone.Synth();
    const synth4 = new Tone.Synth();
    
    const synth5 = new Tone.Synth(
      {
        oscillator:{
          type: 'square'
        },
        envelope: {
          attack: 0,
          decay: 0.1,
          sustain: 0.5,
          release: 0.2
        }
      }
    );
    
    const createWidgetVoice = new Voice(synth1, this.synthBus);
    const deleteWidgetVoice = new Voice(synth2, this.synthBus);
    const updateSelectionVoice = new Voice(synth3, this.synthBus);
    const updateWidgetVoice = new Voice(synth4, this.synthBus);
    const bassline = new Voice(synth5, this.synthBus);

    createWidgetVoice.filter.set({
      frequency: 5000,
      type: "lowpass"
    });
    
    bassline.filter.set({
      frequency: 300,
      type: "lowpass"
    });

    bassline.gain.gain.value = 0.3;

    this.createWidgetScheduler = new Scheduler(createWidgetVoice);
    this.deleteWidgetScheduler = new Scheduler(deleteWidgetVoice);
    this.updateSelectionScheduler = new Scheduler(updateSelectionVoice);
    this.updateWidgetScheduler = new Scheduler(updateWidgetVoice);
    this.basslineScheduler = new Scheduler(bassline);

    // create a new Tone.js MembraneSynth object to use as the kick drum
    this.kick = new Tone.MembraneSynth().connect(this.kickGain);

    this.hihat = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.05,
        release: 0.01,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 3,
    }).connect(this.hatsGain);
    this.hihat2 = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.005,
        release: 0.01,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(this.hatsGain);

    // Set up audio chain
    this.kickGain.connect(this.drumGain);
    this.hatsGain.connect(this.hatsVelocity);
    this.hatsVelocity.connect(this.drumFilter);
    this.drumFilter.connect(this.drumReverbBus);
    this.drumReverbBus.connect(this.drumGain);
    this.drumGain.connect(this.mainBus);

    this.synthBus.connect(this.synthReverbBus);
    this.synthReverbBus.connect(this.mainBus);

    // create a new Tone.js Sequence object
    this.sequence = new Tone.Sequence((time, note) => {

      console.log("sequencestep");
      // Autogen drums
      if (Math.random() > 0.1 && this.widgetSelected) {
        this.hihat2.triggerAttackRelease("C1", "8n", time);
      }
      this.hatsGain.gain.value = (Math.random() + 1 / 2);
      if (this.iterator % 8 === 0) {
        this.kick.triggerAttackRelease("C1", "8n", time);
        this.hatsGain.gain.value = (Math.random() + 1 / 2);
      } else if ((this.iterator+4) % 8 === 0) {
        this.hihat.triggerAttackRelease("C1", "8n", time);
      } else {
      }


      if (this.iterator % 1 === 0) {
        if (this.updateSelectionScheduler.hasScheduledNotes()) {
          this.updateSelectionScheduler.playScheduledNote("8n", time);
        };
      }

      if (this.iterator % 8 === 0) {
        if (this.createWidgetScheduler.hasScheduledNotes()) {
          this.createWidgetScheduler.playScheduledNote("2n", time);
        };

        if (this.deleteWidgetScheduler.hasScheduledNotes()) {
          this.deleteWidgetScheduler.playScheduledNote("8n", time);
        };
      }

      if ((this.iterator + 2) % 4 === 0) {
        if (this.updateWidgetScheduler.hasScheduledNotes()) {
          this.updateWidgetScheduler.playScheduledNote("8n", time);
        };
      }

      if (this.iterator % 1 === 0) {
        this.basslineScheduler.scheduleNoteToPlay("C2");
      if (this.basslineScheduler.hasScheduledNotes()) {
        this.basslineScheduler.playScheduledNote("64n", time);
        this.basslineScheduler.synthVoice.gain.gain.value = ((4 - this.iterator % 4) / 4) * 0.4;
      };
      }

      this.iterator++;
    }, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "16n");

    this.transport.start();
  }

  async startOrchestra(){
    await Tone.start();
    console.log('audio is ready');
    this.isInitialized = true;
  }

  async startSequencer() {
    if (!this.isInitialized) {
      await this.startOrchestra();
    }
    this.sequence.start();
  }
  
  stopSequencer() {
    this.sequence.stop();
  }

  calculateStereoLocation(viewport: Rect, widget: Rect): number {
    const viewportOrigin = viewport.x + (viewport.width / 2);
    const widgetOrigin = widget.x + (widget.width / 2);
    const xOffset = viewportOrigin - widgetOrigin;
    var panRatio =-1 * (xOffset * 2) / viewport.width;
    panRatio = Math.min(Math.max(panRatio, -1), 1);
    return panRatio;
  }
}