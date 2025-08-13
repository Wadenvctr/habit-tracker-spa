import React, { useCallback } from "react";
import { Input, Button, message, Form } from "antd";
import { Formik, type FormikProps } from "formik";
import * as Yup from "yup";
import { api } from "../api/api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(50, "Имя должно содержать максимум 50 символов")
    .optional(),
  email: Yup.string()
    .email("Некорректный email адрес")
    .required("Email обязателен"),
  password: Yup.string()
    .required("Пароль обязателен"),
});

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues: RegisterFormValues = {
    name: "",
    email: "",
    password: "",
  };

  const handleSubmit = useCallback(async (values: RegisterFormValues) => {
    try {
      const res = await api.register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password.trim(),
      });
      dispatch(loginSuccess(res));
      navigate("/habits");
      message.success("Регистрация успешна!");
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      const errorMessage = error?.response?.data?.message || "Ошибка регистрации";
      message.error(errorMessage);
    }
  }, [dispatch, navigate]);

  return (
    <React.Fragment>
      <div>
        <h2>Регистрация</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikHandleSubmit, isSubmitting }: FormikProps<RegisterFormValues>) => (
          <Form onFinish={formikHandleSubmit} layout="vertical">
            <Form.Item
              label="Имя (необязательно)"
              validateStatus={errors.name && touched.name ? "error" : ""}
              help={errors.name && touched.name ? errors.name : ""}
            >
              <Input
                name="name"
                placeholder="Введите ваше имя (необязательно)"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              validateStatus={errors.email && touched.email ? "error" : ""}
              help={errors.email && touched.email ? errors.email : ""}
            >
              <Input
                name="email"
                type="email"
                placeholder="Введите ваш email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Пароль"
              validateStatus={errors.password && touched.password ? "error" : ""}
              help={errors.password && touched.password ? errors.password : ""}
            >
              <Input.Password
                name="password"
                placeholder="Введите пароль"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                block
              >
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>
        )}
        </Formik>
      </div>
    </React.Fragment>
  );
}

export default RegisterPage;
