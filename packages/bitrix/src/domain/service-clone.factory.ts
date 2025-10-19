import { Initializable } from './interfaces/initializable.interface';

export class ServiceClonerFactory {
    clone<T extends Initializable<any>>(
        ClassRef: new (...args: any[]) => T,
        initParam: Parameters<T['init']>[0],
    ): T {
        const instance = new ClassRef();
        instance.init(initParam);
        return instance;
    }
}
