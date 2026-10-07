import { NextResponse } from 'next/server';

export interface ApiResponseSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiResponseError {
  success: false;
  message: string;
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const body: ApiResponseSuccess<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return NextResponse.json(body, { status });
}

export function apiError(message: string, status = 400) {
  const body: ApiResponseError = {
    success: false,
    message,
  };
  return NextResponse.json(body, { status });
}
