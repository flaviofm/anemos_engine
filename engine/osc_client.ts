const osc = require('node-osc');
const client = new osc.Client('localhost', 7000); 
const sceneCommand = '/composition/layers/1/clips/1/connect';
export async function startScene() {
  const message = new osc.Message(sceneCommand);
  client.send(message, (error) => {
    if (error) {
      console.error('Error sending OSC command:', error);
    } else {
      console.log('OSC command sent successfully!');
    }
  });
  return
}

