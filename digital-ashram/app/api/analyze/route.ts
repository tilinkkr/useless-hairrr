import { NextResponse } from "next/server";
import { detectFollicularVoid, calculateHoloFollicularCount } from "../../../utils/analysis";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

export const runtime = "nodejs";

async function runPythonAnalysis(imageBuffers: Buffer[]): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // Prepare data for Python script
      const inputData = {
        front: imageBuffers[0].toString('base64'),
        back: imageBuffers[1].toString('base64'),
        left: imageBuffers[2].toString('base64'),
        right: imageBuffers[3].toString('base64')
      };

      // Resolve Python executable: prefer project venv, else system 'python'
      const cwd = process.cwd();
      const venvPythonWin = path.resolve(cwd, "..", "venv", "Scripts", "python.exe");
      const venvPythonUnix = path.resolve(cwd, "..", "venv", "bin", "python");
      const pythonExec = fs.existsSync(venvPythonWin)
        ? venvPythonWin
        : fs.existsSync(venvPythonUnix)
        ? venvPythonUnix
        : "python";

      // Spawn Python process
      const pythonProcess = spawn(pythonExec, ["utils/python_bridge.py"], {
        cwd,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            if (result.success) {
              resolve(result.results);
            } else {
              reject(new Error(result.error || 'Python analysis failed'));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError}`));
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${stderr}`));
        }
      });

      // Send input data to Python process
      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();

    } catch (error) {
      reject(error);
    }
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = ['front', 'back', 'left', 'right'].map(key => formData.get(key) as Blob);
    const buffers = await Promise.all(files.map(file => file.arrayBuffer().then(buf => Buffer.from(buf))));

    const isVoid = await detectFollicularVoid(buffers);
    if (isVoid) {
      return NextResponse.json({ 
        count: 0, 
        status: "Void Detected",
        analysis_type: "baldness_detection",
        details: {
          total_hairs: 0,
          confidence_score: 1,
          analysis_time: "0.01s",
          view_breakdown: [
            { view: 'Front', hairs: 0, weight: 0.4 },
            { view: 'Back', hairs: 0, weight: 0.4 },
            { view: 'Left', hairs: 0, weight: 0.1 },
            { view: 'Right', hairs: 0, weight: 0.1 },
          ]
        }
      });
    }

    try {
      const analysis_results = await runPythonAnalysis(buffers);
      
      return NextResponse.json({
        count: analysis_results.total_hairs ?? 0,
        status: "Advanced Analysis Complete",
        analysis_type: "sophisticated_analysis",
        confidence: analysis_results.confidence,
        view_contributions: analysis_results.view_contributions,
        heatmaps: analysis_results.heatmaps,
        details: {
          total_hairs: analysis_results.total_hairs ?? 0,
          confidence_score: analysis_results.confidence ?? 0,
          analysis_time: analysis_results.analysis_time ?? "N/A",
          view_breakdown: analysis_results.view_contributions ?? []
        }
      });
    } catch (analysis_error) {
      console.error("Sophisticated analysis failed, falling back to basic:", analysis_error);
      
      try {
        const count = await calculateHoloFollicularCount(buffers);
        const numericCount = typeof count === 'number' ? count : Number(String(count).replace(/[,\s]/g, ''));
        
        return NextResponse.json({ 
          count: Number.isFinite(numericCount) ? numericCount : 0, 
          status: "Basic Analysis Complete",
          analysis_type: "fallback_analysis",
          details: {
            total_hairs: Number.isFinite(numericCount) ? numericCount : 0,
            confidence_score: 0.5,
            analysis_time: "1.5s",
            view_breakdown: [
              { view: 'Front', hairs: 0, weight: 0.4 },
              { view: 'Back', hairs: 0, weight: 0.4 },
              { view: 'Left', hairs: 0, weight: 0.1 },
              { view: 'Right', hairs: 0, weight: 0.1 },
            ]
          }
        });
      } catch (fallbackError) {
        console.error("Fallback analysis failed:", fallbackError);
        return NextResponse.json({ 
          count: 0,
          status: "Analysis Failed",
          analysis_type: "error"
        }, { status: 500 });
      }
    }
  } catch (err) {
    console.error("Analysis failed:", err);
    return NextResponse.json({ 
      count: 0,
      error: "Analysis failed", 
      status: "Error",
      analysis_type: "error"
    }, { status: 500 });
  }
}


