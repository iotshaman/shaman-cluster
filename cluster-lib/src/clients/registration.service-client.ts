import { HttpService } from "../services/http.service";
import { RegistrationForm } from "../forms/registration-form";
import { NodeRegistration } from '../types/node-registration';

export interface IRegistrationServiceClient {
  registerNode(form: RegistrationForm): Promise<NodeRegistration>;
}

export class RegistrationServiceClient extends HttpService implements IRegistrationServiceClient {

  registerNode(form: RegistrationForm): Promise<NodeRegistration> {
    return this.post('registration', form);
  }

}