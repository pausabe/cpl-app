import React from 'react';
import { FATAL_WAIT, recordClosingError } from '../services/health/healthMonitor';

// A screen that fails while it is drawn does not go through ErrorUtils, where healthMonitor listens: React
// hands it straight to React Native, which closes the app. It is caught here only to write it down first,
// a moment at most, and then it is let go to close the app as it always did. Nothing is shown instead.

interface Props {
  children: React.ReactNode;
  // What happens once it is written down: thrown again, by default. The tests look at it instead.
  letGo?: (error: unknown) => void;
}

interface State {
  failed: boolean;
  error: unknown;
  released: boolean;
}

export default class RenderCrashGuard extends React.Component<Props, State> {
  state: State = { failed: false, error: null, released: false };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { failed: true, error };
  }

  componentDidCatch(error: unknown) {
    let done = false;
    const release = () => {
      if (done) return;
      done = true;
      if (this.props.letGo) this.props.letGo(error);
      else this.setState({ released: true });
    };
    recordClosingError('render', error).then(release, release);
    setTimeout(release, FATAL_WAIT);
  }

  render() {
    if (this.state.released) throw this.state.error;
    return this.state.failed ? null : this.props.children;
  }
}
