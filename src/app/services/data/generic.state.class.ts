import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter, distinctUntilChanged } from 'rxjs/operators';
import * as _isEqual from 'lodash.isequal';
import * as _clonedeep from 'lodash.clonedeep';

// each entity interface can define the props to validate against
export interface Prop {
  prop: string;                                   // property name
  def: any;                                       // property default value if found undefined
}

export enum LoadStates {
  Empty = 'Empty',
  Loading = 'Loading',
  Loaded = 'Loaded',
  Syncing = 'Syncing',
  SyncReady = 'SyncReady',
  ErrorSync = 'ErrorSync',
  Saving = 'Saving'
}

// the type definition of state
export interface GenericState<T> {
  ids: string[];                                  // the data IDs as a list - not sure if needed
  entityMap: { [id: string]: T };                 // the data as a map
  loadState: LoadStates;
  errorMessage: any;
}

//
// GenericStateService
// the base class the providers will use to extend upon - the heart of our redux engine
//
export class GenericStateService<T> {

  protected props: Array<Prop> = [];                                  // meta data - which properties has the entity - e.g 'name', 'uid'
  protected propList: string[] = [];

  protected uidKey: string;                                               // the unique identifier key of each entity - e.g 'uid'
  protected state: GenericState<T>;                                       // the state this service is maintaining

  protected entitiesAsArray$ = new BehaviorSubject<Array<T>>([]);  // the stream of entityMap as array - undefined at start
  protected state$ = new BehaviorSubject<GenericState<T>>({               // the stream of state
    ids: [],
    entityMap: {},
    loadState: LoadStates.Empty,
    errorMessage: null
  });

  //
  // uid is the unique key that identifies an entity - we need it at construction time
  //
  constructor(uid: string) {
    this.uidKey = uid;
    this.state = {
      ids: [],
      entityMap: {},
      loadState: LoadStates.Empty,
      errorMessage: null
    };
  }

  setEntityProperties(props: Prop[]) {
    this.props = props;
    this.propList = props.map((propkey: Prop) => {
      return propkey.prop;
    });
  }

  // delete full state - a reset
  resetState() {
    // a new instance needed here - simple clone
    const state = Object.assign({}, {
      ids: [],
      entityMap: {},
      loadState: LoadStates.Empty,
      errorMessage: null
    });
    this.emitAndSave(state);
  }

  setState(state: any) {
    let newState: GenericState<T>;
    newState = this.validateState(state);
    this.emitAndSave(newState);
  }

  updateLoadState(newLoadState: LoadStates, error: any = null) {
    const newState: GenericState<T> = this.clone(this.state);
    newState.loadState = newLoadState;
    newState.errorMessage = error;
    this.emitAndSave(newState);
  }

  // generic READ function - with filter to allow "unloaded" state - e.g. skeleton viewer
  getEntitiesAsArray$(): Observable<Array<T>> {
    return this.entitiesAsArray$
      .pipe(filter(entities => typeof entities !== 'undefined')) as Observable<Array<T>>;
  }

  getState$(): Observable<GenericState<T>> {
    return this.state$ as Observable<GenericState<T>>;
  }

  getIDs$(): Observable<Array<string>> {
    return this.state$
      .pipe(map(state => state.ids), distinctUntilChanged()) as Observable<Array<string>>;
  }

  peekArray() {
    return [].concat(Object.keys(this.state.entityMap).map(id => {
      return this.state.entityMap[id];
    }));
  }

  peekState() {
    return { ...this.state };
  }

  peekValue(id: string) {
    console.log('PEEKING', this.state.entityMap, id, this.state.entityMap[id]);
    return Object.assign({}, this.state.entityMap[id]);
  }

  //
  // HELPERS
  //

  getUniqueID() {
    const now = Date.now();
    return 'uid' + now + '.' + Math.random() * now;
  }


  // validate any given state into a valid state
  validateState(state: GenericState<T>): GenericState<T> {
    const newState: GenericState<T> = this.clone(state);

    // Revalidate entries - to cater for upgrading after data model changes
    newState.ids = Object.keys(newState.entityMap);

    for (const id of newState.ids) {
      newState.entityMap[id] = this.validate(newState.entityMap[id]);
    }

    return newState;
  }



  // to validate for any given props, if we need to reduce the object (e.g. public version of object)
  validateWithProps(input, props: Prop[]): T {
    const output = {};

    for (const prop of props) {
      if (typeof input[prop.prop] === 'undefined' || input[prop.prop] === null) {
        output[prop.prop] = prop.def;
      } else {
        output[prop.prop] = input[prop.prop];
      }
    }

    const entityID = output[this.uidKey];
    if (typeof entityID === 'undefined' || entityID === '' || entityID === null) {
      output[this.uidKey] = this.getUniqueID();
    }

    return output as T;
  }

  // assure given any (untyped) input, there is an entity with proper content/type not null/undefined
  validate(input: any): T {
    return this.validateWithProps(input, this.props) as unknown as T;
  }

  // cloning for immutability
  clone(input) {
    //  console.log('CLONEEEEEE', input, _clonedeep(input));
    return _clonedeep(input);
    // return JSON.parse(JSON.stringify(input));
  }

  isEqual(first, second: any): boolean {
    return _isEqual(first, second);
  }

  // get the property identifying each unique entity
  getUniqueKey() {
    return this.uidKey;
  }

  // emitAndSave state and entityMap to observers
  protected emitAndSave(newState: GenericState<T>) {

    const oldArray = Object.keys(this.state.entityMap).map(id => {
      return this.state.entityMap[id];
    });
    // store locally
    this.state = newState;

    const newArray = Object.keys(this.state.entityMap).map(id => {
      return this.state.entityMap[id];
    });

    // all entityMap as array emitAndSaveted
    if (JSON.stringify(newArray) !== JSON.stringify(oldArray)) {
      this.entitiesAsArray$.next(newArray);
    }

    // the state emitAndSaveted
    this.state$.next(this.state);
  }

  protected async sha256(str) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(str)
    );
    return Array.prototype.map
      .call(new Uint8Array(buf), (x) => ('00' + x.toString(16)).slice(-2))
      .join('');
  }
}
