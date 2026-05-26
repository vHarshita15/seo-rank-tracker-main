import express from "express";
import auth from "../middleware/auth.js";
import { analyzeUrl, deleteAnalysis, getAnalyses, getAnalysis } from "../controllers/analysisController.js";

const analysisRouter = express.Router();

analysisRouter.post('/', auth, analyzeUrl);
analysisRouter.get('/history', auth, getAnalyses);
analysisRouter.get('/:id', auth, getAnalysis);
analysisRouter.delete('/:id', auth, deleteAnalysis);

export default analysisRouter;