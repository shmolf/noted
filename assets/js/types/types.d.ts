declare module 'worker-loader!*' {
    class WebpackWorker extends Worker {
      constructor();
    }

    export default WebpackWorker;
}

// https://stackoverflow.com/a/47125875
declare module '*.md' {
  const content: any;
  export default content;
}
