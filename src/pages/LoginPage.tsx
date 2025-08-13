import React, { useCallback } from "react";
import { Input, Button, message, Form } from "antd";
import { Formik, type FormikProps } from "formik";
import * as Yup from "yup";
import { api } from "../api/api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Некорректный email адрес")
    .required("Email обязателен"),
  password: Yup.string()
    .required("Пароль обязателен"),
});

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
  };

  const handleSubmit = useCallback(async (values: LoginFormValues) => {
    try {
      const res = await api.login(values.email, values.password);
      dispatch(loginSuccess({ token: res.token, user: res.user }));
      message.success("Вход выполнен");
      navigate("/habits");
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      const errorMessage = error?.response?.data?.message || "Неверные данные для входа";
      message.error(errorMessage);
    }
  }, [dispatch, navigate]);

  return (
    <React.Fragment>
      <div style={{ maxWidth: 400, margin: "auto", paddingTop: 40 }}>
        <h2>Вход в систему</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikHandleSubmit, isSubmitting }: FormikProps<LoginFormValues>) => (
          <Form onFinish={formikHandleSubmit} layout="vertical">
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
                Войти
              </Button>
            </Form.Item>
          </Form>
        )}
        </Formik>
      </div>
    </React.Fragment>
  );
}

export default LoginPage;
