import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repository: string }> },
) {
  const { owner, repository } = await params;
  const url = `https://api.github.com/repos/${owner}/${repository}/community/profile`;
  const response = await fetch(url);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
