export interface UserType {
  _id: string;
  username: string;
  email: string;
  uid: string;
  password: string;
  gender: string;
  dateOfBirth: Date;
  passportNo: string;
  passportExpiry: Date;
  passportIssuingCountry: {
    countryCode: string;
    countryName: string;
  };
  panNo: string;
  nationality: {
    countryCode: string;
    countryName: string;
  };
  address: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>;
  phone: string;
  userType: "Admin" | "Client";
  profilePic: string;
  wallet: number;
  refCode: string;
  deviceId: string;
  deviceToken: string;
  googleId: string;
}

export interface SignupSearchResponse {
  data: UserType[];
}

export interface SignupResponseType {
  data: Array<object>;
  flag: boolean;
  type: string;
  message: string;
}

export interface LoginResponseType {
  data: object;
  flag: boolean;
  type: string;
  message: string;
}

export interface UserResponseType {
  data: object;
  flag: boolean;
  type: string;
  message: string;
}
