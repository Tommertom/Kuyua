import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, timeout } from 'rxjs/operators';
import { FirebaseService } from '../firebase.service';
import { GenericStateService, LoadStates } from './generic.state.class';

export class RealtimeRemoteStateService<T> extends GenericStateService<T> {

  protected remotePath = '';
  private maskedRemotePath = '';
  protected firebaseService: FirebaseService;
  private subscription: Subscription;

  protected userID = null;

  private lastHash = '';

  constructor(uid: string, maskedRemotePath: string, firebaseService: FirebaseService) {
    super(uid);
    this.maskedRemotePath = maskedRemotePath;
    this.firebaseService = firebaseService;
    this.setupMonitoring();
  }

  setupMonitoring() {
    this.firebaseService.getAuthObject()
      .onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          this.remotePath = this.maskedRemotePath.replace('[UID]', firebaseUser.uid);
          this.userID = firebaseUser.uid;
          console.log('Monitor on', this.remotePath);

          this.subscription = this.firebaseService
            .collection(this.remotePath)
            .valueChanges()
            /*
                        .snapshotChanges()
                        //  .pipe(timeout(4000))
                        .pipe(
                          map(actions => actions.map(a => {
                            const data = a.payload.doc.data() as T;
                            return { ...data };
                          }))

                        )
            */
            .pipe(filter(dataArray => JSON.stringify(dataArray) !== this.lastHash))
            .subscribe(newArray => {
              // stupid way to do distinct
              const newStuff = JSON.stringify(newArray) !== this.lastHash;
              console.log('Received collection for ' + this.uidKey, newStuff, this.lastHash.length);
              if (newStuff) {

                this.lastHash = JSON.stringify(newArray);

                const entityMap = {};
                let ids = [];
                newArray.forEach(item => {
                  ids = [item[this.uidKey], ...ids];
                  entityMap[item[this.uidKey]] = this.validate(item);
                });

                this.setState({
                  ids,
                  entityMap,
                  loadState: LoadStates.Loaded
                });
              }
            },
              err => {
                console.log('Error getting collection ' + this.uidKey, err);
              });
        }

        if (!firebaseUser) {
          if (this.subscription) {
            console.log('Monitor off', this.remotePath, firebaseUser);
            this.subscription.unsubscribe();
            this.userID = null;
            this.lastHash = '';
            const ids = [];
            const entityMap = {};
            this.setState({
              ids,
              entityMap,
              loadState: LoadStates.Loaded
            });

          }
        }
      });
  }

  // CRUD work to remote storage
  upsert(entity: T) {
    const cloneOfEntity = this.clone(entity);

    if (JSON.stringify(cloneOfEntity) === JSON.stringify(this.state.entityMap[cloneOfEntity[this.uidKey]])) {
      return;
    }
    console.log('Realtime upsert', cloneOfEntity, this.remotePath + cloneOfEntity[this.uidKey]);

    this.updateLoadState(LoadStates.Syncing);
    this.firebaseService
      .doc(this.remotePath + cloneOfEntity[this.uidKey]) // '/' +
      .set(cloneOfEntity, { merge: true })
      .then(_ => {
        this.updateLoadState(LoadStates.SyncReady);
        return true;
      })
      .catch(errr => {
        this.updateLoadState(LoadStates.ErrorSync, errr);
      });
  }

  async upsertArray(newDataList: T[]) {
    const firestoreBatch = this.getFirestoreBatch();
    const now = Date.now();

    console.log('Realtime upsertArray', newDataList);

    for (const newDataItem of newDataList) {
      const cloneOfEntity = this.clone(newDataItem);
      let entityID = newDataItem[this.uidKey];

      if (typeof entityID === 'undefined' || entityID === '') {
        entityID = 'uid' + now + '.' + Math.random() * now;
      }
      cloneOfEntity[this.uidKey] = entityID;

      if (JSON.stringify(cloneOfEntity) !== JSON.stringify(this.state.entityMap[cloneOfEntity[this.uidKey]])) {
        // todo - we really want to do an merge:true?
        firestoreBatch.set(this.firebaseService.doc(this.remotePath + cloneOfEntity[this.uidKey]).ref, cloneOfEntity, { merge: true });
      }
    }

    return this.commitFirestoreBatch(firestoreBatch);
  }

  updatePropOfEntity(keyvalues: { prop: string, value: any }, id: string) {
    return this.updatePropsOfEntity([keyvalues], id);
  }

  updatePropsOfEntity(keyvalues: { prop: string, value: any }[], id: string) {
    const updatedProps = {};

    console.log('Realtime updatePropsOfEntity', keyvalues, id);

    for (const keyvalue of keyvalues) {
      if (
        this.propList.includes(keyvalue.prop) &&
        JSON.stringify(this.state.entityMap[id][keyvalue.prop]) !== JSON.stringify(keyvalue.value)
      ) { updatedProps[keyvalue.prop] = keyvalue.value; }
    }

    if (Object.keys(updatedProps).length > 0) {
      this.updateLoadState(LoadStates.Syncing);

      return this.firebaseService.doc(this.remotePath + id)
        .update(updatedProps)
        .then(_ => {
          this.updateLoadState(LoadStates.SyncReady);
          return true;
        })
        .catch(errr => {
          this.updateLoadState(LoadStates.ErrorSync, errr);
          return false;
        });
    } else {
      return false;
    }
  }

  deleteKeyValue(deleteList: { key: string, value: string }[]) {

    console.log('Realtime deleteKeyValue', deleteList);

    const firestoreBatch = this.getFirestoreBatch();

    // lets iterate through all entityMap to do the delete on key-value
    for (const entitiyID of Object.keys(this.state.entityMap)) {
      let elementHit = false;

      // and check for each key-value pair if this entitie needs to be removed
      for (const { key, value } of deleteList) {
        if (this.state.entityMap[entitiyID][key] === value) {
          elementHit = true;
        }
      }
      // if found, remove the entity
      if (elementHit) {
        firestoreBatch.delete(this.firebaseService.doc(this.remotePath + entitiyID).ref);
      }
    }
    return this.commitFirestoreBatch(firestoreBatch);
  }

  // delete a list of entities - by ID
  deleteIDs(deleteListOfIDs: string[]) {
    const uidDeleteList = deleteListOfIDs.map(id => {
      return {
        key: this.uidKey, value: id
      };
    });
    this.deleteKeyValue(uidDeleteList);
  }

  // delete a single entity by ID
  deleteID(id: string) {
    this.deleteIDs([id]);
  }

  deleteAll() {
    console.log('DELETING', this.remotePath);
    const firestoreBatch = this.getFirestoreBatch();
    // lets iterate through all entityMap to do the delete on key-value
    for (const entitiyID of Object.keys(this.state.entityMap)) {
      firestoreBatch.delete(this.firebaseService.doc(this.remotePath + entitiyID).ref);
    }
    return this.commitFirestoreBatch(firestoreBatch);
  }

  getFirestoreBatch() {
    this.updateLoadState(LoadStates.Syncing);
    return this.firebaseService.batch();
  }

  commitFirestoreBatch(batch: any) {
    this.updateLoadState(LoadStates.SyncReady);
    return batch.commit()
      .catch(errr => {
        this.updateLoadState(LoadStates.ErrorSync, errr);
      });
  }
}


/*


                /*
                // for debugging
                if (this.lastHash !== '') {

                  const diff = (diffMe, diffBy) => diffMe.split(diffBy).join('');
                  const hashCode = s => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)

                  console.log('NEW STUFFF',
                    hashCode(JSON.stringify(newArray)),
                    hashCode(this.lastHash),
                    newArray,
                    JSON.parse(this.lastHash)
                  );
                  const oldArray = JSON.parse(this.lastHash);
                  oldArray.forEach(oldItem => {
                    const sameItem = newArray.filter(newItem => newItem[this.uidKey] === oldItem[this.uidKey]);
                    if (sameItem.length === 0) {
                      console.log('Old Item not more in newlist', oldItem);
                    }

                    if (sameItem.length === 1) {
                      const isSame = JSON.stringify(oldItem) === JSON.stringify(sameItem[0]);
                      if (!isSame) {
                        console.log('NOT EQUAL', oldItem, sameItem[0]);

                        Object.keys(oldItem).forEach(key => {
                          if (oldItem[key] !== sameItem[0][key]) {
                            console.log('Changed ', key, oldItem[key], sameItem[0][key]);
                          }
                        });
                      }
                    }


                    if (sameItem.length > 1) {
                      console.log('CRAZEY STUFF', sameItem);
                    }

                  });

                }
*/



