export type ObservableListener<T> = (value: T) => any
export type ObservableUnsubscribeFn = () => void

export class Observable<T> {
  protected listeners: Array<ObservableListener<T>> = []

  public subscribe(listener: ObservableListener<T>): ObservableUnsubscribeFn {
    this.listeners.push(listener)
    return () => {
      // Calling it again does not remove another listener
      const index = this.listeners.indexOf(listener)
      if (index !== -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  public notify(value: T) {
    // A copy, so a listener that unsubscribes does not make the next one be skipped. Listeners removed by an
    // earlier one are not called.
    this.listeners.slice().forEach((listener) => this.listeners.indexOf(listener) !== -1 && listener(value))
  }
}
