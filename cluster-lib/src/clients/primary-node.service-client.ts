import { RegistrationForm } from "../forms/registration-form";
import { HttpService } from "../services/http.service";

export class PrimaryNodeServiceClient extends HttpService {

  constructor(apiBaseUri: string) {
    super(apiBaseUri);
  }

  registerNode(form: RegistrationForm): Promise<any> {
    return this.post('registration', form);
  }

}