import fs from 'fs'


export async function GET(context) {
    const file = fs.readFileSync('atom.xml', 'utf8')
    return new Response(
        file
    )
}
