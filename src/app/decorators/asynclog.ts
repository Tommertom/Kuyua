import { environment } from 'src/environments/environment';

export function AsyncLog() {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...params: any[]) => Promise<any>>) => {
    const oldFunc = descriptor.value;
    // tslint:disable-next-line: space-before-function-paren
    descriptor.value = async function (x) {
      const result = await oldFunc.apply(this, arguments);
      //  await delay(param) //some async operation

      if (!environment.production) {
        console.log('----->Method call', propertyKey, x);
      }

      return result;
    };
  };
}


