export function supportsSpeech() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

var voices = speechSynthesis.getVoices();
console.log(voices);

export function speak(text, voice) {
  var utterance = new SpeechSynthesisUtterance(text);
  var voices = speechSynthesis.getVoices();
  console.log(voices);
  utterance.voice = voices.filter(function(voice) { return voice.name == 'Alex'; })[0];
  speechSynthesis.speak(utterance)
}
