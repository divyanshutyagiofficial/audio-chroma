import * as React from 'react';
import Meyda from 'meyda';
import { chord } from 'tonal-detect';
import './style.css';

const pitchClasses = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export default function App() {
  const [audio, setAudio] = React.useState(null);
  const [chroma, setChroma] = React.useState(null);

  const setBase64 = (file) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      setAudio(reader.result);
    };
    reader.onerror = function (error) {
      setAudio('');
    };
  };

  var loadFile = async (my_file) => {
    const response = await fetch(my_file);
    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }

    const song = document.querySelector('audio');
    var context = new AudioContext();

    const source = context.createMediaElementSource(song);
    const gainNode = context.createGain();
    source.connect(gainNode);
    gainNode.connect(context.destination);
    gainNode.gain.value = 1;

    const options = {
      audioContext: context, // required
      source: source, // required
      bufferSize: 4096, // required
      // hopSize: 256, // optional
      // callback: (features) => {
      //   try {
      //     //console.log(features.chroma);
      //     console.log(features.chroma);
      //   } catch (err) {
      //     console.log(err);
      //   }
      // },
      // callback: getFeature // optional callback in which to receive the features for each buffer
    };

    const analyser = Meyda.createMeydaAnalyzer(options);

    var loop = () => {
      // requestAnimationFrame(loop);
      // try/catch for codesandbox - things get bad if an error happens in a loop
      try {
        const features = analyser.get(['chroma']);
        console.log(features);
        setChroma(features);
      } catch (e) {}
    };

    song.addEventListener('play', () => {
      context.resume();

      const id = setInterval(() => {
        loop();
      }, 100);

      song.addEventListener('pause', () => {
        clearInterval(id);
      });
    });
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          setBase64(file);
          loadFile(file);
        }}
      />

      <div>
        <audio src={audio} controls={true} crossOrigin={'anonymous'}></audio>
      </div>

      <div>
        <ul>
          {pitchClasses.map((note, i) => (
            <li>
              <span>{note}</span>
              <input
                type="range"
                max={1}
                min={0}
                value={
                  (chroma && chroma['chroma'] && chroma['chroma'][i]) > 0.85
                    ? chroma['chroma'][i]
                    : 0
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// let result = wav.decode(buffer);
// const signal = result.channelData; // array of Float32Arrays
// // console.log(result.sampleRate);// For sample rate
// // console.log(result.channelData);

// // console.log(signal);

// // const context = new AudioContext();
// const analyzer = Meyda.createMeydaAnalyzer({
//   audioContext: audioCtx,
//   source: signal,
//   bufferSize: 4096,
//   featureExtractors: ["chroma"],
//   callback: (features) => {
//     try {
//       //console.log(features.chroma);
//       console.log(features.chroma);
//     } catch (err) {
//       console.log(err);
//     }
//   }
// });

// analyzer.start();
