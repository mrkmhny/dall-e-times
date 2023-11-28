/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import {addToQueue} from './page'

jest.mock('node-fetch');
import fetch from 'node-fetch';
const {Response} = jest.requireActual('node-fetch');

it('Fetches data and renders successfully', () => {
  fetch.mockReturnValue(Promise.resolve(new Response('{"key": "value"}')));
  expect(addToQueue()).toBeTruthy()
})