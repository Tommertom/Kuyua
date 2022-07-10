import firebase from 'firebase/app';
// import * as firebase from 'firebase';
import 'firebase/analytics';
import { environment } from 'src/environments/environment';


// import 'firebase/auth';
// import 'firebase/analytics';

declare var fbq;

export function GoogleAnalytics(options: string = 'no_page', additionalString: string = ''): any {

  const logToAnalytics = (logString: string) => {
    console.warn(logString);

    if (environment.production) {
      setTimeout(() => {

        if (firebase.analytics) {
          firebase.analytics().logEvent(logString);
        }

        if (fbq) {
          // console.log('FBQ', fbq);
          fbq('trackCustom', logString);
        }

      }, 100);
    }
  };

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

    if (descriptor === undefined) {
      const logString = additionalString !== '' ?
        `${options}__${additionalString}` : `${options}`;
      logToAnalytics(logString);
      return {
        value: (...args: any[]) => { }
      };
    }

    const originalMethod = descriptor.value;
    // tslint:disable-next-line: space-before-function-paren
    descriptor.value = function (...args: any[]) {
      const logString = additionalString !== '' ?
        `${options}_${propertyKey}_${additionalString}` : `${options}_${propertyKey}`;
      logToAnalytics(logString);

      const result = originalMethod.apply(this, args);
      return result;
    };

    return descriptor;
  };
}

/*

// https://gist.github.com/sothmann/915b13fdce147e6e1a1e

// https://gist.github.com/remojansen/16c661a7afd68e22ac6e



export function GoogleAnalytics(options: string = 'no_page', additionalString: string = ''): any {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...params: any[]) => Promise<any>>) => {
    const logString = additionalString !== '' ?
      `--->${options}_${propertyKey}_${additionalString}` : `--->${options}_page_${propertyKey}`;

    if (typeof descriptor === 'number') {

      //   firebase.default.analytics().logEvent(logString);
      console.log('--GA-->', logString);
    } else {
      const oldFunc = descriptor.value;

      console.log('DSADSDSD', descriptor, this, arguments);
      // tslint:disable-next-line: space-before-function-paren
      descriptor.value = async function (x) {
        const result = await oldFunc.apply(this, arguments);

        //    firebase.default.analytics().logEvent(logString);
        console.log('--GA-->', logString);
        return result;
      };
    }
  };
}
*/

/*
export function GoogleAnalyticsProperty(options: string = 'no_page', additionalString: string = ''): any {
  return (target: Object, propertyKey: string) => {
    console.log('evaluate: ', options, propertyKey);
    const logString = additionalString !== '' ? `--->${options}_${propertyKey}_${additionalString}` : `--->${options}_page_${propertyKey}`;
    firebase.default.analytics().logEvent(logString);
    console.log('--GA-->', logString);
    // tslint:disable-next-line: only-arrow-functions
    return function () {

    };
  };

}
*/


