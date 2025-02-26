import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LeagueAuth from './Auth/LeagueAuth';
import LeaguePublic from './Public/LeaguePublic'

function League() {
  const { isAuthenticated} = useAuth()
    return isAuthenticated ? <LeagueAuth /> : <LeaguePublic />
  }

export default League
