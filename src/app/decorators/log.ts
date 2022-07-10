export function Log() {
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...params: any[]) => any>) => {
        const oldFunc = descriptor.value;
        // tslint:disable-next-line: space-before-function-paren
        descriptor.value = function (x) {
            const result = oldFunc.apply(this, arguments);
            //  await delay(param) //some async operation
            console.log('----->Method call', propertyKey, x);
            return result;
        };
    };
}
