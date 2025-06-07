import { FC } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaLock, FaEnvelope, FaPhone } from "react-icons/fa";

// Регулярные выражения
const EMAIL_REGEX =
  /^[a-z0-9!#$%&'*+/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

// TODO Переписать регулярку потому что API оказывается не все из них хавает
const PHONE_REGEX =
  /^((8|\+374|\+994|\+995|\+375|\+7|\+380|\+38|\+996|\+998|\+993)[\- ]?)?\(?\d{3,5}\)?[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}[\- ]?\d{1}(([\- ]?\d{1})?[\- ]?\d{1})?$/;

interface FormProps {
  isRegistering: boolean;
  isSendingData: boolean;
  onSubmit: (data: FormValues) => void;
  toggleRegister: () => void;
}

export interface FormValues {
  username: string;
  password: string;
  repeatPassword?: string;
  email?: string;
  phone?: string;
}

const Form: FC<FormProps> = ({
  isRegistering,
  isSendingData,
  onSubmit,
  toggleRegister,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-6 p-8 bg-neutral rounded-xl shadow-xl text-text-primary"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isRegistering ? "Регистрация" : "Вход в аккаунт"}
      </h2>

      <div className="relative">
        <FaUser className="absolute top-3 left-3 text-" />
        <input
          {...register("username", { required: "Введите имя пользователя" })}
          type="text"
          placeholder="Username"
          className="pl-10 py-2 w-full border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-input-border"
        />
        {errors.username && (
          <p className="text-text-error text-sm">{errors.username.message}</p>
        )}
      </div>

      <div className="relative">
        <FaLock className="absolute top-3 left-3 text-" />
        <input
          {...register("password", { required: "Введите пароль" })}
          type="password"
          placeholder="Password"
          className="pl-10 py-2 w-full border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-input-border"
        />
        {errors.password && (
          <p className="text-text-error text-sm">{errors.password.message}</p>
        )}
      </div>

      {isRegistering && (
        <>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-" />
            <input
              {...register("repeatPassword", {
                required: "Повторите пароль",
                validate: (value) =>
                  value === password || "Пароли не совпадают",
              })}
              type="password"
              placeholder="Repeat Password"
              className="pl-10 py-2 w-full border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-input-border"
            />
            {errors.repeatPassword && (
              <p className="text-text-error text-sm">
                {errors.repeatPassword.message}
              </p>
            )}
          </div>

          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-" />
            <input
              {...register("email", {
                required: "Введите email",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Неверный email",
                },
              })}
              type="email"
              placeholder="Email"
              className="pl-10 py-2 w-full border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-input-border"
            />
            {errors.email && (
              <p className="text-text-error text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <FaPhone className="absolute top-3 left-3 text-" />
            <input
              {...register("phone", {
                pattern: {
                  value: PHONE_REGEX,
                  message: "Неверный номер телефона",
                },
              })}
              type="tel"
              placeholder="Phone (optional)"
              className="pl-10 py-2 w-full border border-input-border rounded-lg bg-input-bg focus:outline-none focus:ring-2 focus:ring-input-border"
            />
            {errors.phone && (
              <p className="text-text-error text-sm">{errors.phone.message}</p>
            )}
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isSendingData}
        className="cursor-pointer w-full py-2 px-4 bg-button-bg text-button-text rounded-lg hover:bg-hover transition disabled:bg-disabled disabled:cursor-not-allowed"
      >
        {isRegistering ? "Зарегистрироваться" : "Войти"}
      </button>

      <p
        onClick={toggleRegister}
        className="text-sm text-center underline cursor-pointer mt-4 hover:text-hover"
      >
        {isRegistering
          ? "Уже есть аккаунт? Войти"
          : "Нет аккаунта? Зарегистрироваться"}
      </p>
    </form>
  );
};

export default Form;
