export default class StateBase{

    GetClone(){
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}